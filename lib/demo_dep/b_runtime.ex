defmodule BRuntime do
  import BRuntime.CExport
  def call, do: 42

  def list, do: [42]

  def run do
    clist()
  end

  @comp BRuntime.CComp.list()
  def comp, do: @comp

  def runtime do
    BRuntime.CRuntime.list()
  end
end
