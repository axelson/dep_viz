import Config

# For development, we disable any cache and enable
# debugging and code reloading.
#
# The watchers configuration can be used to run external
# watchers to your application. For example, we use it
# with webpack to recompile .js and .css sources.
config :gviz, GVizWeb.Endpoint,
  url: [host: "gviz.home.lan"],
  http: [port: 4040],
  debug_errors: true,
  code_reloader: true,
  check_origin: false,
  watchers: [
    esbuild: {Esbuild, :install_and_run, [:default, ~w(--watch)]},
    sass: {DartSass, :install_and_run, [:default, ~w(--watch)]}
  ],
  live_reload: [
    patterns: [
      ~r"priv/static/.*(js|css|png|jpeg|jpg|gif|svg)$",
      ~r"priv/sample_xref/.*(dot)$",
      ~r"dist/.*(js|css|png|jpeg|jpg|gif|svg)$",
      ~r"lib/gviz_web/(live|views)/.*(ex)$",
      ~r"lib/gviz_web/templates/.*(ex)$"
    ]
  ]

config :esbuild,
  version: "0.14.41",
  default: [
    args:
      ~w(js/app.js --bundle --minify --sourcemap=external --target=es2020 --outdir=../priv/static/js),
    cd: Path.expand("../assets", __DIR__),
    env: %{"NODE_PATH" => Path.expand("../deps", __DIR__)}
  ]

config :dart_sass,
  version: "1.61.0",
  default: [
    args: ~w(--load-path=node_modules --no-source-map css/app.scss ../priv/static/css/app.css),
    cd: Path.expand("../assets", __DIR__)
  ]

# Do not include metadata nor timestamps in development logs
config :logger, :console, format: "[$level] $message\n"

# Set a higher stacktrace during development. Avoid configuring such
# in production as building large stacktraces may be expensive.
config :phoenix, :stacktrace_depth, 20

# Initialize plugs at runtime for faster development compilation
config :phoenix, :plug_init_mode, :runtime
