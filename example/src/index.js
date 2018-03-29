import instantiate from "./addTwo.wasm"

instantiate().then(({addTwo}) => {
    console.log("addTwo(1, 2)", addTwo(1, 2));
})
