import Config

config :gviz,
  namespace: GViz

# Configures the endpoint
config :gviz, GVizWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "8xJzBHfqJr4addPiUqlefBIipUwmvDirioranvyHijBkSYSviZHK2WKoAjQsYTqF",
  render_errors: [view: GVizWeb.ErrorView, accepts: ~w(html json), layout: false],
  pubsub_server: GViz.PubSub,
  live_view: [signing_salt: "atPPIhiP"]

config :gviz, :phoenix_endpoint, GVizWeb.Endpoint

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
