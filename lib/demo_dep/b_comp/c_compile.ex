defmodule BComp.CComp do
  # test2
  def list, do: [42]

  def run do
    BComp.CComp.DRuntime.list()
  end
end
