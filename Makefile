PGDIR:=/usr/local/var/postgres
PGUSER=nflistener
PGHOST=localhost
PGPASSWORD=nflistener
PGDATABASE=nflistener
PGPORT=5433
APIPORT:=5000
APIURL:=http://localhost
SERVERPORT:=8080
.PHONY: test

all: install

# ~~~~~~~~ #
nfbroadcast:
	@echo ">>> Setting up Nextflow nfbroadcast..."
	git clone https://github.com/qbicsoftware/nextflow.git nfbroadcast && \
	cd nfbroadcast && \
	git checkout nfbroadcast && \
	make

nfbroadcast/main.nf: nfbroadcast
	cd nfbroadcast && \
	ln -fs ../nf-script/main.nf

nfbroadcast/nextflow.config: nfbroadcast
	cd nfbroadcast && \
	ln -fs ../nf-script/nextflow.config

install: nfbroadcast nfbroadcast/main.nf nfbroadcast/nextflow.config setup-db
	@echo ">>> Setting up Node.js libraries..."
	npm install

# start PostgresSQL with the default config location (macOS Homebrew)
setup-db: stop-db
	@echo ">>> Setting up PostgresSQL databse..."
	-pg_ctl -D "$(PGDIR)" start
	-createdb
	psql -f database.sql
	pg_ctl -D "$(PGDIR)" stop
	pg_ctl -D "$(PGDIR)" -o "-p $(PGPORT)" -U "$(PGUSER)" start

# stop the db if its running
stop-db:
	@echo ">>> Shutting down any currently running PostgresSQL databse at $(PGDIR)..."
	@-set -x; pg_ctl -D "$(PGDIR)" stop

# make sure the db is running; start it if not, on port 127.0.0.1:5433
check-db: stop-db
	@echo ">>> Checking status of PostgresSQL database at $(PGDIR), port: $(PGPORT), user: $(PGUSER)..."
	@-set -x; if [ ! "$$(psql -c "SELECT 1" -d '$(PGDATABASE)' > /dev/null 2>&1 ; echo $$?)" -eq 0 ]; then pg_ctl -D "$(PGDIR)" -o "-p $(PGPORT)" -U "$(PGUSER)" start 2>&1 ; fi

start-db:
	@echo ">>> Starting PostgresSQL database $(PGDATABASE) at $(PGDIR), port: $(PGPORT), user: $(PGUSER), if not already running..." ; \
	if [ ! "$$(pg_isready -q -d '$(PGDATABASE)' -p '$(PGPORT)'; echo $$?)" -eq 0 ]; then \
	echo ">>> Database not running, starting database server..." ; \
	pg_ctl -D "$(PGDIR)" -o "-p $(PGPORT)" -U "$(PGUSER)" start 2>&1 ; \
	else echo ">>> Database already running" ; \
	fi

db-contents: start-db
	psql -h "$(PGHOST)" -p "$(PGPORT)" -U "$(PGUSER)" -c 'SELECT * FROM messages;'

db-workflows: start-db
	psql -h "$(PGHOST)" -p "$(PGPORT)" -U "$(PGUSER)" -c 'SELECT DISTINCT runid,runname FROM messages;'

db-dump:
	pg_dump -h "$(PGHOST)" -p "$(PGPORT)" -U "$(PGUSER)" -d "$(PGDATABASE)" --format c > nflistener.dump

nflistener.dump:
	git checkout origin/pg_dump -- nflistener.dump

db-restore: nflistener.dump
	pg_restore -h "$(PGHOST)" -p "$(PGPORT)" -U "$(PGUSER)" -d "$(PGDATABASE)" --no-owner nflistener.dump

# start the API and listen for POST messages from nextflow
listen: start-db
	@export PGUSER="$(PGUSER)"; \
	export PGHOST="$(PGHOST)"; \
	export PGPASSWORD="$(PGPASSWORD)"; \
	export PGDATABASE="$(PGDATABASE)"; \
	export PGPORT="$(PGPORT)"; \
	node api.js "$(APIPORT)" & \
	pid="$$!" ; \
	echo ">>> Started API listening with process id $${pid}" ; \
	echo ">>> Starting Nextflow process" ; \
	$(MAKE) launch-nextflow ; \
	echo ">>> Killing API process $${pid}" ; \
	kill "$${pid}"

# run Nextflow with http POST messages enabled
launch-nextflow:
	cd nfbroadcast && \
	./launch.sh run main.nf -with-weblog "http://localhost:$(APIPORT)/message"

# launch the API in the background before launching the web server
# TODO: come up with a better way to wait for the API to initialize before starting the server
server:
	@$(MAKE) api & \
	sleep 1 ; \
	echo ">>> Starting web server, view at http://localhost:$(SERVERPORT)" ; \
	node server.js "$(SERVERPORT)" "$(APIURL)" "$(APIPORT)"

# start Node with db connection configs
node: start-db
	export PGUSER="$(PGUSER)"; \
	export PGHOST="$(PGHOST)"; \
	export PGPASSWORD="$(PGPASSWORD)"; \
	export PGDATABASE="$(PGDATABASE)"; \
	export PGPORT="$(PGPORT)"; \
	node

# launch the API process
api: start-db
	@export PGUSER="$(PGUSER)"; \
	export PGHOST="$(PGHOST)"; \
	export PGPASSWORD="$(PGPASSWORD)"; \
	export PGDATABASE="$(PGDATABASE)"; \
	export PGPORT="$(PGPORT)"; \
	node api.js "$(APIPORT)" & pid="$$!" ; \
	echo ">>> Started API on background process $${pid}" ; \
	wait "$${pid}"

DATAFILE:=test/data.json
post-message:
	curl -d '@$(DATAFILE)' -H "Content-Type: application/json" -X POST "http://localhost:$(APIPORT)/message/"

POST:=1
get-message:
	curl -X GET "http://localhost:$(APIPORT)/message/$(POST)"

RUNID:=02fb8245-31ef-48bc-b732-bcd69e962612
get-workflow:
	curl -X GET "http://localhost:$(APIPORT)/workflow/$(RUNID)"

get-workflows:
	curl -X GET "http://localhost:$(APIPORT)/workflows/"

test:
	node test.js "$(APIPORT)" "$(POST)"

clean:
	rm -f output.*.json
