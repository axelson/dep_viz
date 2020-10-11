defmodule BComp do
  import BComp.CExport
  def list, do: [42]

  def run do
    clist()
  end

  @comp BComp.CComp.list()
  def comp, do: @comp

  def runtime do
    BComp.CRuntime.call()
  end
end
