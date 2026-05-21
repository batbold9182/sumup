## Plan for Warsaw Beauty Salon Explorer
## Choosing a stack
*Backend*:Express.js , node.js
*Database*:MongoDB/ pros: comfrotable , scalable , knows much better than sql
                    cons: uses more storage 
           Sqlite(from what i understand)/ pros:less storage , simple uses onefile database
                                           cons:less flexible adding new fields harder if i need salons socials it might become hard
*Frontend*:react it was recommended also familiar with it.
          :found *ReDoS* vulnurability as an accident (accidently writed . on my search it shows most of the results) that could lead data exposure (later know it was called *ReDoS*)

*PriceFilter Feature*: removed duo to lack of data every salon that is fetched got null value. Backend is still active 
               to get it but felt useless in the frontend so commented out.              
## Collecting data - populateDB.ts
*Booksy*/pros:Verifies data's , local specifically in poland, hard to setup
        /cons:no official api , complex might need to get their dev plan
chosen *Google places pai*/pros:Official api, easy pagination ,enough data,easy setup 
                   /cons:Some fields might be missing in small salons
        According to 'https://developers.google.com/maps/documentation/places/web-service/legacy/place-data-fields'
        they do not such thing as 'provide services offered'
        to get district i used *places.addressComponents* and sublocality

*npm run populate* needed 1 time script to fetch all the search query in to my database after that can use my own db
to remove duplicates used set *if (!seen.has(place.id)) {seen.add(place.id);.. to skip* and manually implemented 5 search quary
to get more data according to *https://developers.google.com/maps/documentation/places/web-service/legacy/search-text* each query returns maximum of 60 result using pagetoken and removing duplicated one's able to get total unique: 257 results.   

## Backend/api
*places.ts* used to fetch from directly google places api more of a like test to check my *GOOGLE_API_KEY* etc left comments.

app.get("/salons") - get all salons
app.get("/salon/:id") - single salon
app.post("/salon) - add new salon
app.patch("salon) - update specific detail 
*used patch over put* - since put modifies all the data meanwhile salon only change specific data's like phone number etc.
app.delete("/salon") - delete salon




                                                      
