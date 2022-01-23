# Web Crawler

## Build

This project was created using **Nodejs** so it can be built using the **npm install** command and it will automatically download all the node modules needed to run the program.

## Run

The program has 2 ways to run: the first by directly invoking the entry point with the node command:

>Example
```
node app --url http://books.toscrape.com/ --maxdist 2 --db books.txt    
```
And the second way is creating a CLI command and calling it from there, for this you have to go to the directory path where the program is located and give it the following command:

```
npm link
```

This command creates a symbolic link between the project directory and executable command. Now you can run the program using it as a CLI Tool.

>Example
```
crawler --url http://books.toscrape.com/ --maxdist 2 --db books.txt    
```

## Command Options
-u, --url      The url of website to fetch                          [required]

-m, --maxdist  The maximum distance from the initial website        [required]

-d, --db       The name of the database                             [required]

 --help     Show help 

## Note
The database with the given name is created in the folder where the CLI command is called.

