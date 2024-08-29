# hop-backend

---

## How to run

- Run `npm i`

- Follow the example .env.example to setup your environment variables

- Run `npm run migrate`

- Run `npm run dev`

alternatively you can just build a docker image with the dockerfile and run it.

---

## API Docs

Once you have the backend running you can go to route "/api-docs", for all the information regarding the endpoints and models.

<img src="readMePics\apidocs.png" title="" alt="" width="558">

---

## Tech Stack

- Express

- SocketIO

- PostgreSQL

- Drizzle

- Zod

- Swagger (API-Docs)

- Puppeteer

- Cloudinary

---

## Schema

<img title="" src="readMePics\dataStruct.png" alt="" width="429">

---

## Building the Backend for Hop

When we set out to build the backend for Hop, our primary goal was to create a system that wasn't just functional, but professional and scalable. We wanted a foundation that could grow with us, adapting to new challenges and features without requiring a complete overhaul. This philosophy guided every decision we made throughout the development process.

Our database schema became the backbone of our system, elegantly tracking users, spaces, and the connections between them. We're particularly proud of our approach to managing online status. Instead of constantly updating every user's status, we implemented a more efficient system that only keeps track of currently active users. When a user logs in, we note it; when they leave, we clear it. This simple yet effective approach exemplifies our commitment to smart, scalable solutions.

We extended this efficiency to user statuses within spaces. By using a nullable spaceID in our user status table, we could easily determine whether a user was in the dashboard (null spaceID) or in a specific space (non-null spaceID). This seemingly small detail proved invaluable, especially when determining which spaces needed thumbnail updates.

Speaking of thumbnails, we implemented an innovative solution using Puppeteer. Inspired by livestreaming platforms, we created a system that generates real-time previews of active spaces. Our microservice provides a VNC URL, which our Puppeteer bot uses to enter the space, input the password, capture a screenshot, and upload it to Cloudinary for frontend rendering. It's a simple yet powerful system that adds significant value to the user experience.

Throughout development, we prioritized data integrity and validation. We integrated Zod into our workflow, setting up schemas to validate incoming data before it reaches our database. Thanks to Zod's infertype feature, we could easily convert these validation schemas into TypeScript types,  without sacrificing development time.

One decision that paid off was our early implementation of API documentation. While it required some ongoing maintenance, the time saved in communication with our frontend developers and in debugging our own code was immeasurable. Even for smaller projects, we can't overstate the value of clear, up-to-date API docs.

As we built out our system, we found that our modular approach to models and controllers allowed us to expand and refine our backend with ease. Each new feature or adjustment slotted neatly into our existing architecture, validating our initial design decisions.


## Contributors

- [KRoses96](https://github.com/KRoses96)
- [hmbakhsh](https://github.com/hmbakhsh)
- [Sunilpaul16](https://github.com/Sunilpaul16)
- [DavilaDawg](https://github.com/DavilaDawg)