(function() {
    var G = glocal.Promise;
    console.log('main context : ', G.context)


    G.context.test = true;

    G.resolve('tututu')
        .delay(100)
        .glocalize('shloup', true)

    //.slog("slog 1 : ")
    .clog()
        //.elog()
        //.delay(500)
        .glocalize('br', 'fe')
        //.slog("slog 2 : ")
        .clog()
        .elog()
        //.elog()

    G.resolve('glup')
        .glocalize('bloupi', 'a')
        //.slog("slog 3 : ")
        .clog()
        .delay(300)
        .then(function(s) {
            return G.resolve(45678)
                //.delay(100)
                .clog()
                .glocalize("ho", true)
                .clog()
                //.then(function(){ throw new Error("hello"); })
        })
        .glocalize('fleu', 'y')
        //.slog("slog 4 : ")
        .clog()
        .then(function(s) {
            return G.resolve(true)
                .delay(100)
                .clog()
                .glocalize("haaaa", false)
                .clog()
                .then(function(s) {
                    return G.resolve("roooooo")
                        //.delay(100)
                        .clog().glocalize("hi", false).clog("hi");
                })
                .clog("hi")
        })
        .clog()
        .log("end log")
        .elog()


    console.log('main context end : ', G.context)
        /*
        G.resolve("bloutch")
        .glocalize("zooooo", "floupi")
        .delay(1000)
        .then(function(s){
          console.log("g : ", s, G.context);
        }, function(e){
          console.log("error : ", e);
        });


        */


});
