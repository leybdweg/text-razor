- this project runs nodejs 12+, rmq and on mysql

#### HOW TO SET THIS PROJECT
-  npm i

#### HOW TO START THIS PROJECT

-  npm run db:migrate
-  npm run build
-  npm run start

##### available settings by envs:

- APP_PORT
- DB_HOST 
- DB_USER
- DB_PASSWORD 
- DB_SCHEME 
- RMQ_URL
- OUTPUT_FORMAT, (csv or json), default json



TODO:
- tests
- actual text-razor integration

##### KNOWN PROBLEMS/LIMITATIONS -> solution:
 ###### File reading: 
    - not scalable -> 1 define some sort of batch (defined by lines handled), would need to consider invalid urls (would help to avoid needless requests to razor)
    - invalid urls:
        -- not well defined -> define better what is invalid and what isnt, define how to handle invalids
        -- full of failure points -> consider saving invalids outside of memory only, i.e., redis or some db table
    -- export conclusions:
        -- trigger checking-in time loop -> change to event driven somehow
        -- trigger in memory only -> persiste it somewhere
        -- not scalable -> move to outside of in-memory in order to be handled by any process
        -- not defined where to save conclusions -> define (actual file, db..)
    - file not defined (/path/to/file) -> take file path or file data some way 
        -- OUTPUT_FORMAT as ENV VAR -> fetch from somewhere more dynamic
        
 ###### Entity fetching:
    -- RMQ: not sure this is the best approach, even though it's viable -> research some other msg-broker technology (i.e. kafka, aeron) or some other solution
      
 ###### DB PERSISTENCE:
    -- MySQL -> research a better alternative
    -- overload of insert queries -> consider breaking into partitions for multiple instances
    -- duplicated ids -> rethink tables diagram for a better approach, maybe consider a background db procedure/process to clean retrieved data

 ###### RMQ: 
    - queue creation: not well defined -> create on both consumer and producer (even though convention is consumer should create)
 
   

