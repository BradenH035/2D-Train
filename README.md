This project shows a 2D model train going around a track using the Canvas API. It was created for the Computer Graphics class at the University of Wisconsin in Spring of 2023 and uses the class software framework. This code should not be copied for other student assignments.

Main file: tr-01-01.html

The biggest challenge of this project was getting the train to move in at a constant rate, as the distance between points on the Bezier Curves varied (in other words, figuring out position by using arc length parameterization).
Another challenge was getting the train tracks to be separated evenly. This was once again solved using arc length parameterization

Notable Features:
- Number of Cars
  - Can add up to 8 cars
  - The head of the train has a unique design with a smoke stack
  - The second and third cars are coal cars and are also unique
  - The rest are basic passenger carts
  - Optional: Trucked Wheels checkbox adds wheels to the cars. Cool design feature
- Arc Length Parameterization
  - Can be turned on and off. Notice that when it is turned off, each car on the train moves at a different speed, so the train is no longer connected
- Trucked Wheels
  - Can be turned on and off. Just a design feature
- Simple Track
  - Can turn of the complex track and see the outline of the curves
  - Couples well with Draw Points checkbox, as you can see where one curve ends and another begins
- Complex Track
  - Train tracks
  - Two parallel lines
    - Surprisingly difficult to do. Instead of curves separated by a gap based on the initial set of points, I had to draw many small line segments adjacent to the main curve. It is not as noticeble as one would think.
- Draw Points
  - Draws the points that each Bezier Curve is based on
