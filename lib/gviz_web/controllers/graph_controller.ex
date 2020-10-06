defmodule GVizWeb.GraphController do
  use GVizWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end

  def force(conn, _params) do
    render(conn, "force_layout.html")
  end

  def dot(conn, _params) do
    sample_dot_path = Path.join(:code.priv_dir(:gviz), "sample_xref_graph.dot")
    sample_dot = File.read!(sample_dot_path)

    text(conn, sample_dot)
  end
end
