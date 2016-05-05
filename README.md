Opengamebox 2
=============

Opengamebox 2 is a networked gaming platform for playing board games. This
repository contains the official web client. The server component is in
[opengamebox2-server](https://github.com/Opengamebox2/opengamebox2-server)
repository.

Running the web client
----------------------

If you didn't clone this Git repository recursively, you need to initialize
the submodules:

	$ git submodule init

After you checkout a new commit, you need to update the submodules and npm
dependencies:

	$ git submodule update
	$ npm install

You can host a development version of the web client with:

	$ npm start

After that you can open [http://localhost:3000/](http://localhost:3000/). The
page will be automatically updated when you edit the source files.

To deploy the web client to an external web server run:

	$ npm run deploy

and copy the `dist` folder to your web server.

Note that you will also need to have
[the server component](https://github.com/Opengamebox2/opengamebox2-server).
