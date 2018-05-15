
all: install

# ~~~~~~~~ #
nfbroadcast:
	git clone https://github.com/qbicsoftware/nextflow.git nfbroadcast && \
	cd nfbroadcast && \
	git checkout nfbroadcast && \
	git checkout 17dd2d54ba8194b774c870c00c5fd054d6bfb53b && \
	make

nfbroadcast/main.nf: nfbroadcast
	cd nfbroadcast && \
	ln -fs ../nf-script/main.nf

nfbroadcast/nextflow.config: nfbroadcast
	cd nfbroadcast && \
	ln -fs ../nf-script/nextflow.config

install: nfbroadcast nfbroadcast/main.nf nfbroadcast/nextflow.config
	npm install

test:
	cd nfbroadcast && \
	./launch.sh run main.nf

# start PostgresSQL with the default config location (macOS Homebrew)
PGDIR:=/usr/local/var/postgres
PGUSER=nflistener
PGHOST=localhost
PGPASSWORD=nflistener
PGDATABASE=nflistener
PGPORT=5433
setup-db: stop-db
	@echo ">>> Setting up PostgresSQL databse..."
	-pg_ctl -D "$(PGDIR)" start
	-createdb
	psql -f nflistener.sql
	pg_ctl -D "$(PGDIR)" stop
	pg_ctl -D "$(PGDIR)" -o "-p $(PGPORT)" -U "$(PGUSER)" start

# stop the db if its running
stop-db:
	@echo ">>> Shutting down any currently running PostgresSQL databse..."
	-pg_ctl -D "$(PGDIR)" stop

# make sure the db is running; start it if not in port 127.0.0.1:5433
check-db: stop-db
	@echo ">>> Checking status of PostgresSQL databse..."
	-if [ ! "$$(psql -c "SELECT 1" -d nflistener > /dev/null 2>&1 ; echo $$?)" -eq 0 ]; then pg_ctl -D "$(PGDIR)" -o "-p $(PGPORT)" -U "$(PGUSER)" start 2>&1 ; fi

db-contents: check-db
	psql -h "$(PGHOST)" -p "$(PGPORT)" -U "$(PGUSER)" -c 'SELECT * FROM messages;'

launch: check-db
	export PGUSER="$(PGUSER)"; \
	export PGHOST="$(PGHOST)"; \
	export PGPASSWORD="$(PGPASSWORD)"; \
	export PGDATABASE="$(PGDATABASE)"; \
	export PGPORT="$(PGPORT)"; \
	output_file="output.$$(date +%s).json" ; \
	node nflisten.js > "$${output_file}" & \
	pid="$$!" ; \
	echo ">>> process $${pid} outputting to file: $${output_file}" ; \
	( cd nfbroadcast && \
	./launch.sh run main.nf -with-messages http://localhost:5000 ; ) ; \
	echo ">>> killing process $${pid}; output file: $${output_file}" ; \
	kill "$${pid}"

clean:
	rm -f output.*.json
