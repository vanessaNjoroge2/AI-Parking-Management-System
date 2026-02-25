
  # ParkSmart UI Design

  This is a code bundle for ParkSmart UI Design. The original project is available at https://www.figma.com/design/0ZyTN5d7VTXxJK42O4U9dU/ParkSmart-UI-Design.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  

  ## Environment

  Create `frontend/.env` with the backend base URL:

  ```bash
  VITE_API_URL=http://localhost:4367
  ```

  ## Notes

  - Driver flows are wired to auth, parking lot search/details, bookings, and booking history.
  - Owner dashboard + add/edit lot are wired to backend parking lot endpoints.
  - Owner bookings and payments are still mock until backend endpoints are added.