# About that folder

This folder contains code that allows adding visualization information to the database.

> [!TIP]
> This can be useful when, for example, due to errors on the part of other services (not ours), we are unable to create a visualization, but such visualization is necessary for testing or development. To avoid stopping work and blocking the task, visualisation can be added to the database using this code.

## How does it all work?

To work with this functionality, it is important to understand two main entities: `insert.py` and configuration files for each service.

The `insert.py` file is universal code that can write visualization information to the database for any service. To do this, you only need to specify the desired service in the `insert.py` file (or, in other words, connect the necessary configuration).

Services and their configurations are stored in folders such as `./BASE/` or `./OpenAIRE/`. These folders contain two files: `<visualization_id>.json` and `config.json`: 
- The `<visualization_id>.json` file stores visualization data that will be used to build the visualization on the client;
- The `config.json` file stores the rest of the information that is important for creating a database record and will also be partially used on the client.

To connect the required service, simply make a change in line 7 in the `insert.py` file - this is the line where the path to a configuration (variable `CONFIG_PATH`) is created. You need to replace the service name with the required one.

> [!IMPORTANT]
> The name of the service must match the name of the folder where its configurations are stored. Pay attention to the case of the characters!
