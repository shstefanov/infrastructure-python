import sys
import json
import socket



class Infrastructure:

  def __init__(self):
    self.connected = None
    self.options = {}
    self.connect_options = {}
    for option in sys.argv[1:]:
      parts = option.split("=")
      option_name  = parts[0]
      option_value = parts[1]
      if option_name == "connect-port" or option_name == "connect-token":
        self.connect_options[option_name] = option_value
      else:
        self.options[option_name] = option_value
    
    self._events = {}

  def on(self, event, ctx = {}):
    def wrapper(callback):
      if event not in self._events:
        self._events[event] = []
      handlers = self._events[event]
      handlers.append( (callback, ctx, 0 ) )
    return wrapper

  def once(self, event, ctx = {}):
    def wrapper(callback):
      if event not in self._events:
        self._events[event] = []
      handlers = self._events[event]
      handlers.append( (callback, ctx, 1 ) )
    return wrapper

  def off(self, event = None, context = None):
    if not event:
      self._events = {}
    elif event in self._events:
      if not context:
        self._events[event] = []
      else:
        handlers = self._events[event]
        new_handlers = []
        for handler in handlers:
          ctx = handler[1]
          if ctx is not context:
            new_handlers.append(handler)
        if len(new_handlers):
          self._events[event] = new_handlers
        else:
          self._events[event] = []

  def trigger(self, event, *args):
    if event in self._events:
      once_handlers = []
      handlers = self._events[event]
      for handler in handlers:
        callback = handler[0]
        callback(handler[1], *args)
        if handler[2]:
          once_handlers.append(handler)
      if len(once_handlers):
        for handler in once_handlers:
          self.off(event, handler[1])

  def connect(self, options = {} ):

    connect_port  = int(self.connect_options[ "connect-port"  ])
    connect_token = self.connect_options[ "connect-token" ]

    self.socket = socket.socket( socket.AF_INET, socket.SOCK_STREAM )
    self.socket.connect(( '127.0.0.1', connect_port ))
    self.send( connect_token )
    self.connected = 1

    self.trigger("connect")

    while self.connected:
      if "buffer_size" in options: data = self.socket.recv( options.buffer_size )
      else:                        data = self.socket.recv( 32 )
      if not data: continue
      parsed = json.loads(data)
      self.trigger( parsed[0], parsed[1] )

  def disconnect(self):
    if self.connected:
      self.socket.close()
      self.connected = 0
    
  def send(self, data):
    self.socket.send( json.dumps(data) )

  def end(self, err, result):
    if self.connected:
      self.disconnect()      
    
    if err:
      print json.dumps(err)
      sys.exit(1)
    else:
      print json.dumps(result)
      sys.exit(0)



infrastructure = Infrastructure()
