from infrastructure import infrastructure
import json

env = infrastructure

result = {}


@env.on("config")
def cb( ctx, config ):
  env.config = config;

@env.on("args")
def cb( ctx, args ):
  env.end( None, [ env.config, args ] )

env.connect()

