
all: setup

# ~~~~~~~~ #
nfbroadcast:
	git clone https://github.com/qbicsoftware/nextflow.git nfbroadcast && \
	cd nfbroadcast && \
	git checkout nfbroadcast && \
	git checkout 17dd2d54ba8194b774c870c00c5fd054d6bfb53b && \
	make

nfbroadcast/main.nf: nfbroadcast
	cd nfbroadcast && \
	ln -s ../nf-script/main.nf

nfbroadcast/nextflow.config: nfbroadcast
	cd nfbroadcast && \
	ln -s ../nf-script/nextflow.config

setup: nfbroadcast nfbroadcast/main.nf nfbroadcast/nextflow.config

launch:
	cd nfbroadcast && \
	./launch.sh run main.nf -with-messages http://localhost:5000
