var tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".two",
        start: "0% 95%",
        end: "70% 50%",
        scrub: true,
        // markers: true,
    }
})

tl.to("#fanta", {
    top: "113%",
    left: "-10%"
}, 'orange')
tl.to("#orange-cut", {
    top: "160%",
    left: "23%"
}, 'orange')
tl.to("#orange", {
    width: "15%",
    top: "140%",
    right: "10%",
    left: "77%"
}, 'orange')
tl.to("#leaf", {
    top: "110%",
    rotate: "130deg",
    left: "70%"
}, 'orange')
tl.to("#leaf2", {
    top: "110%",
    rotate: "130deg",
    left: "0%"
}, 'orange')
tl.to("#leaf3", {
    top: "120%",
    left: "5%"
}, 'orange')



var tl2 = gsap.timeline({
    scrollTrigger: {
        trigger: ".three",
        start: "0% 95%",
        end: "20% 50%",
        scrub: true,
        // markers: true,
    }
})

tl2.from(".lemon1", {
    rotate: "-90deg",
    left: "-100%",
    top: "110%"
}, 'ca')
tl2.from("#cocacola", {
    rotate: "-90deg",
    top: "110%",
    left: "-100%",
}, 'ca')

tl2.from(".lemon2", {
    rotate: "90deg",
    left: "100%",
    top: "110%"
}, 'ca')
tl2.from("#pepsi", {
    rotate: "90deg",
    top: "110%",
    left: "100%",
}, 'ca')

tl2.to("#orange-cut", {
    width: "20%",
    left: "45%",
    top: "203%"
}, 'ca')
tl2.to("#fanta", {
    width: "34%",
    top: "210%",
    left: "32%",
}, 'ca')