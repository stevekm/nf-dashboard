# NF-Dashboard

Web server app to track Nextflow workflow status messages and display them in a web dashboard.

# Install

```
git clone https://github.com/stevekm/nf-dashboard.git
cd nf-dashboard
make install
```

(Re)initialize the PostgresSQL database for the app:

```
make setup-db
```

Populate the database with test data (HTTP POST messages from Nextflow):

```
make listen
```

- You can run this repeatedly to generate data for several workflows

# Run

You can start the web app with the following command:

```
make server
```

The app will be viewable in your web browser at http://localhost:8080

# Software

- [Java 8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) and macOS/Linux with `bash` required for Nextflow

- Node.js and npm (`brew install node`)

- PostgresSQL (`brew install postgres`)

Tested on macOS 10.10 - 10.12
