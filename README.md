# nflistener

Web server app to listen for HTTP POST messages output by Nextflow ([qbicsoftware](https://github.com/qbicsoftware/nextflow.git) `nfbroadcast` branch)

# Install

```
git clone https://github.com/stevekm/nflistener.git
cd nflistener
make install
```

# Run

You can run the test app with the following command:

```
make launch
```

This will:

- start the listener app, forwarding stdout to a file

- start the demo Nextflow pipeline

- capture JSON output from the Nextflow pipeline in the output file

# Software

- [Java 8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) and macOS/Linux with `bash` required for Nextflow

- Node.js and npm (`brew install node`)

- PostgresSQL (`brew install postgres`)

Tested on macOS 10.10 - 10.12
