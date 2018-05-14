
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

launch:
	@output_file="output.$$(date +%s).json" ; \
	node nflisten.js > "$${output_file}" & \
	pid="$$!" ; \
	echo ">>> process $${pid} outputting to file: $${output_file}" ; \
	( cd nfbroadcast && \
	./launch.sh run main.nf -with-messages http://localhost:5000 ; ) ; \
	echo ">>> killing process $${pid}; output file: $${output_file}" ; \
	kill "$${pid}"

clean:
	rm -f output.*.json
