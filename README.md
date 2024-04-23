Work in progress Stockfish REST API

making this for my own chess discord bots and other chess software that need
stockfish best moves within 3 seconds. (I'm NOT trying to sell this or whatever in the name of Stockfish), 
mostly used for internal software, and of course it be free if I deploy it for other devs!!

Please note this is not ready to use yet.. (I mean you can) if you really want to, check ``` Running it ``` section


## Credits to:
- [Stockfish.wsm](https://www.npmjs.com/package/stockfish.wasm)
- The Stockfish developers (see AUTHORS file). Stockfish [Computer software]. https://github.com/official-stockfish/Stockfish
- [Stockfish js for understanding the flow](https://github.com/nmrugg/stockfish.js)
- [Stockfish standalone nodejs server, I used this for some help, not really but you get the point](https://github.com/hyugit/stockfish-server)

## Running it:
- running on debug mode which runs the engine on server start 
- ``` node server.js debug ```
- running without debug mode
- ``` node server.js ```


## Working endpoints

- **Get best move for current FEN** ``` GET localhost:5000/stockfish/bestmove?fen=rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2 ```
- **Get eval for current FEN**  ``` GET localhost:5000/stockfish/eval?fen=rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2 ```
- **Get depth info for current FEN** 
-  ``` GET localhost:5000/stockfish/depthinfo?fen=rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2&depth=20```

## Todos
- top lines (wip)
- check mate (wip)

## License:
follows same as Stockfish GPL