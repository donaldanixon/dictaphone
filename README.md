# Dictaphone

This is a demo project I used to learn how Transformers.js works.  This is running on a [Github Page](https://donaldanixon.github.io/dictaphone)

Credit must go to [Xenova](https://github.com/xenova/whisper-web/tree/main/src).  I have stripped most of the AI inference code from there and simplified it for this, and then put a new front end using React on it.

---

### Installation

* Clone project
* Npm install
* Npm run dev to run locally (or edit config and run npm run deploy to add to your own github page)

---

### To-do

* Add a SQLite db to allow storage and recollection of texts (and audio as well if possible)
* Fix the record button moving across when recording from microphone
* Fix the top margin as gap is too large on mobile