defmodule GViz.Configuration do
  use Skogsra

  @envdoc "My hostname"
  app_env :my_hostname, :gviz, :hostname,
    default: "localhost"

  @envdoc "Port"
  app_env :port, :gviz, [:http, :port],
    os_env: "PORT",
    default: 4000,
    type: :pos_integer
end
