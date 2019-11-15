import cmp from "../src/js/utils/cmp.js"

function test(expected, returned) {
    let div = document.createElement('div');
    div.classList.add("test-block");
    let left = div.appendChild(document.createElement('div'));
    let right = div.appendChild(document.createElement('div'));
    left.classList.add("result-panel", "left-panel");
    right.classList.add("result-panel", "right-panel");
    let pre = left.appendChild(document.createElement("pre"));
    pre.innerText = JSON.stringify(expected, null, "    ");
    pre = right.appendChild(document.createElement("pre"));
    pre.innerText = JSON.stringify(returned, null, "    ");
    let res = false;
    if (cmp(expected, returned)) {
        div.classList.add("test-success");
        res = true;
    } else {
        div.classList.add("test-fail");
    }
    document.getElementById("test-results").append(div);
    return res;
}

async function asyncTest(expected, aPromise) {
    return test(expected, await aPromise);
}

export {
    test,
    asyncTest,
};