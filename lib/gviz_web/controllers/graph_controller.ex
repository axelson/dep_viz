defmodule GVizWeb.GraphController do
  use GVizWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
