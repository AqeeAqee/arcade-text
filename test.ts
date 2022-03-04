let sm1: TextSprite = null
info.setScore(99999)
info.setLife(5)
let heights = [5, 8, 12, 24]
let y = 20
let x = 10
for (let h of heights) {
    sm1 = textsprite.create("水 冰" + "H" + h, 9, 8)
    sm1.setCharsPerLine(3)
    sm1.setIcon(img`
        . . 8 . .
        . . 8 . .
        . 8 8 8 .
        8 8 9 8 .
        8 9 1 8 .
        8 9 1 9 8
        8 8 9 9 8
        . 8 8 8 .
    `)
    sm1.setBorder(1, 6, 1)
    sm1.setMaxFontHeight(h)
    sm1.setOutline(1, 1)
    sm1.top = y
    sm1.left = x
    y += sm1.height + 2
    if(h==12){
        x=70
        y=20
        }
}
