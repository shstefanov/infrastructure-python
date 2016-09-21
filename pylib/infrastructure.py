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

  def on(self, event, callback, ctx = {}):
    if event not in self._events:
      self._events[event] = []

    handlers = self._events[event]
    handlers.append({ callback: callback, ctx: ctx, once: 0 })

  def once(self, event, callback, ctx = {}):
    if event not in self._events:
      self._events[event] = ()

    handlers = self._events[event]
    handlers.append({ callback: callback, ctx: ctx, once: 1 })

  def off(self, event = None, callback = None):
    if not event:
      self._events = {}
    elif event in self._events:
      new_handlers = ()
      handlers = self._events[event]
      for handler in handlers:
        cb = handler.callback
        if cb is not callback
          new_handlers.append(handler)
      if len(new_handlers):
        self._events[event] = new_handlers
      else:
        self._events[event] = ()

  def trigger(self, event, *args):
    if event in self._events[event]:
      once_handlers = ()
      handlers = self._events[event]
      for handler in handlers:
        handler.callback(handler.ctx, *args)
        if handler.once:
          once_handlers.append(handler)
      if len(once_handlers):
        for handler in once_handlers:
          self.off(event, handler.callback)

  def connect(self):
    connect_port  = int(self.connect_options[ "connect-port"  ])
    connect_token = self.connect_options[ "connect-token" ]

    self.socket = socket.socket( socket.AF_INET, socket.SOCK_STREAM )
    self.socket.connect(( '127.0.0.1', connect_port ))
    self.socket.send( connect_token )
    self.connected = 1



    self.end(None, (connect_port, connect_token))
    # self.connect_port  = sys.argv[1]
    # self.connect_token = sys.argv[2]
    # print "Connecting ::: ..."

  def disconnect(self):
    if self.connected:
      self.socket.close()
    

  def end(self, err, result):
    self.disconnect()
    if err:
      print json.dumps(err)
      sys.exit(1)
    else:
      print json.dumps(result)
      sys.exit(0)



infrastructure = Infrastructure()
