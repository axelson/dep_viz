defmodule GVizWeb.GraphController do
  use GVizWeb, :controller
  require Logger
  alias NimbleCSV.RFC4180, as: CSV

  def index(conn, _params) do
    render(conn, "index.html")
  end

  def force(conn, _params) do
    render(conn, "force_layout.html")
  end

  def force_data(conn, _params) do
    sample_dot_path = Path.join(:code.priv_dir(:gviz), "sample_xref_graph.dot")
    sample_dot = File.read!(sample_dot_path)
    graph = Dotx.decode!(sample_dot)
    headers = ["type", "id", "source", "target", "label"]

    rows =
      graph.children
      |> Enum.flat_map(fn
        %Dotx.Node{id: id} ->
          [["node", id, nil, nil, nil]]

        %Dotx.Edge{from: from, to: to} = edge ->
          [
            ["edge", nil, from.id, to.id, label(edge)],
            ["node", from.id, nil, nil, nil],
            ["node", to.id, nil, nil, nil]
          ]

        element ->
          Logger.debug("ignoring node #{inspect(element)}")
          []
      end)
      |> Enum.uniq()

    csv = CSV.dump_to_iodata([headers | rows])

    text(conn, csv)
  end

  defp label(%Dotx.Edge{attrs: %{"label" => label}}), do: label
  defp label(%Dotx.Edge{}), do: ''

  def dot(conn, _params) do
    sample_dot_path = Path.join(:code.priv_dir(:gviz), "sample_xref_graph.dot")
    sample_dot = File.read!(sample_dot_path)

    text(conn, sample_dot)
  end
end
