# GViz

To start your Phoenix server:

  * Install dependencies with `mix deps.get`
  * Install Node.js dependencies with `npm install` inside the `assets` directory
  * Start Phoenix endpoint with `mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

## Notes

### Drawing directional arrows
Used a combination of:
* https://stackoverflow.com/questions/11121465/scaling-an-arrowhead-on-a-d3-force-layout-link-marker
* https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/marker-end

Main things to remember:
- The arrow head size is proportional to the stroke width
- The arrow head is drawn with a svg marker element

TODO:
- [ ] Click on a node to keep it selected
- [x] Show a list of files on the left
- [x] Allow filtering in the list of files

Future:
- Configurable node coloring based on filename prefix

Ideas:
- can you click on a node and give it gravity
  put the selected node at the top and then the rest will hang down based on
  how many jumps they are away
