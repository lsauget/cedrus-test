# NOTES.md by Leonard Sauget

This file should contain:
   - Architecture decisions and trade-offs
   - What you would improve with more time
   - Any assumptions made
   - Feedback regarding the test is always appreciated!


## Things to mention 
- I used npm instead of bum because of too old processor not implementing the proper SSE instructions..
- there is an hydratation error in cloned repo, I did not try to fix it

## Architecture decisions and trade-offs

- for the Buiding GET endpoint, I tried to divide the code in 
  - model/type
  - validation
  - service/business
  - controller/endpoint (here api/building/route.ts)
Following clean architecture main principle, the goal is to decouple business logic from technical implementation. In lib/buildings/service.ts we only have business logic but without any access to data/database/infrastructure.

- adding integration tests for Buiding GET endpoint covering:
  - basic functionnality
  - filtering
  - sorting
  - pagination
  - aggregation
  - response (correct + error)

## What you would improve with more time
- fix hydratation error in cloned repo
- draw to filter works holding Shift but not perfectly (worst with Ctrl held). I would display these commands at startup.

## Any assumptions made
- 

## Feedback regarding the test is always appreciated!
- 1h to do everything and have a smart review on every point?????