defmodule GVizWeb.Endpoint.CertificationTest do
  use GVizWeb.ConnCase

  import SiteEncrypt.Phoenix.Test

  test "certification" do
    clean_restart(GVizWeb.Endpoint)
    cert = get_cert(GVizWeb.Endpoint)
    assert cert.domains == ~w/pham.jasonaxelson.com depviz.jasonaxelson.com/
  end
end
