namespace SpriteKind {
    //% isKind
    export const Text = SpriteKind.create();
}

//% blockNamespace="textsprite"
//% blockGap=8
class TextSprite extends Sprite {
    constructor(
        public text: string,
        public bg: number,
        public fg: number,
        public maxFontHeight: number,
        public borderWidth: number,
        public borderColor: number,
        public padding: number,
        public outlineWidth: number,
        public outlineColor: number,
        public icon: Image = null,
    ) {
        super(image.create(0,0));
        this.setKind(SpriteKind.Text);
        this.setFlag(SpriteFlag.Ghost, true);
        this.update()
    }

    //multilines
    charsPerLine:number=1000 //a big number

    public update() {
        const borderAndPadding = this.borderWidth + this.padding + this.outlineWidth;
        const iconWidth = this.icon ? this.icon.width + this.padding + this.outlineWidth : 0;
        const iconHeight = this.icon ? this.icon.height : 0;
        const font = textsprite.getFontForTextAndHeight(this.text, this.maxFontHeight);
        let lineHeight = font.charHeight + 1 + this.outlineWidth*2

        let paragraphs = this.text.split("\n")
        
        let charsPerLine = paragraphs.reduce((p, n, i) => {return Math.max(p, Math.min(n.length, this.charsPerLine))}, 0)
        let totalLineCount = paragraphs.reduce((p, n, i) => { return p + Math.ceil(Math.max(1,n.length) / charsPerLine) }, 0)
        let width = iconWidth + font.charWidth * charsPerLine + 2 * borderAndPadding;
        let height = lineHeight * totalLineCount
        height = Math.max(iconHeight, height) + 2 * borderAndPadding;
        const img = image.create(width, height);
        img.fill(this.borderColor);
        img.fillRect(this.borderWidth, this.borderWidth, width - this.borderWidth * 2, height - this.borderWidth * 2, this.bg)
        let textHeightOffset = (height - lineHeight * totalLineCount) / 2
        
        paragraphs.forEach((paragraph, j) => {
            for (let i = 0; i < Math.ceil(Math.max(1,paragraph.length)/charsPerLine);i++){
                img.print(paragraph.substr(i * charsPerLine, charsPerLine), iconWidth + borderAndPadding, textHeightOffset, this.fg, font);
                textHeightOffset += lineHeight
            }
        })

        if (this.outlineWidth > 0)
            textsprite.outlineOtherColor(img, this.fg, this.outlineWidth, this.outlineColor)
        if (this.icon) {
            const iconHeightOffset = (height - iconHeight) / 2
            textsprite.renderScaledImage(this.icon, img, borderAndPadding, iconHeightOffset)
        }
        this.setImage(img)
    }

    /**
     * Set how many characters per line, for multilines mode, set 0 for single line mode.
     * @param chars 0 for single line, big then 0 for mutillines
     */
    //% block="set $this(textSprite) $chars characters per line"
    //% chars.defl=0
    //% chars.min=0
    //% group="Modify"
    //% weight=50
    public setCharsPerLine(chars: number) {
        this.charsPerLine = chars
        this.update();
    }

    //% block="set $this(textSprite) max font height $height"
    //% group="Modify"
    //% weight=50
    public setMaxFontHeight(height: number) {
        this.maxFontHeight = height
        this.update();
    }

    //% block="set $this(textSprite) icon $icon=screen_image_picker"
    //% group="Modify"
    //% weight=46
    public setIcon(icon: Image) {
        this.icon = icon
        this.update()
    }

    //% block="set $this(textSprite) text $text"
    //% group="Modify"
    //% weight=47
    public setText(text: string) {
        this.text = text || ""
        this.update()
    }

    //% block="set $this(textSprite) border $width $color || and padding $padding"
    //% width.defl=1
    //% color.defl=6
    //% color.shadow="colorindexpicker"
    //% group="Modify"
    //% weight=48
    public setBorder(width: number, color: number, padding: number = 0) {
        this.borderWidth = Math.max(width, 0);
        this.borderColor = color;
        this.padding = Math.max(padding, 0);
        this.update()
    }

    //% block="set $this(textSprite) outline $width $color"
    //% width.defl=1
    //% color.defl=6
    //% color.shadow="colorindexpicker"
    //% group="Modify"
    //% weight=49
    public setOutline(width: number, color: number) {
        this.outlineWidth = Math.max(width, 0);
        this.outlineColor = color;
        this.update();
    }
}

//% color=#3e99de
//% icon="\uf031"
//% blockGap=8 block="Text Sprite"
//% groups='["Create", "Modify"]'
namespace textsprite {

    // TODO: downscale and upscale icons?
    export function renderScaledImage(source: Image, destination: Image, x: number, y: number, downScalePowerOfTwo: number = 0) {
        const scale = downScalePowerOfTwo;
        const tile = source
        for (let i = 0; i < source.width; i += 1 << scale) {
            for (let j = 0; j < source.height; j += 1 << scale) {
                if (source.getPixel(i, j) != 0) {
                    destination.setPixel(x + (i >> scale), y + (j >> scale), source.getPixel(i, j))
                }
            }
        }
    }

    export function getFontForTextAndHeight(text: string, maxHeight: number): image.Font {
        const baseFont = image.getFontForText(text)
        const hasUnicode = baseFont.charHeight === 12  // this is a hack
        const availableFonts: image.Font[] = hasUnicode 
            ? [baseFont] 
            : [image.font8, image.font5] // 8 and 5 are generally better fonts than 12
        const remainders = availableFonts.map(s => maxHeight % s.charHeight)
        const fontIdx = remainders.reduce((p, n, i) => remainders[p] <= n ? p : i, 99)
        const font = availableFonts[fontIdx]
        return image.scaledFont(font, maxHeight / font.charHeight)
    }

    //% block="text sprite $text || as $fg on $bg"
    //% blockId="textsprite_create"
    //% blockSetVariable="textSprite"
    //% expandableArgumentMode="toggle"
    //% bg.defl=0
    //% bg.shadow="colorindexpicker"
    //% fg.defl=1
    //% fg.shadow="colorindexpicker"
    //% group="Create"
    //% weight=100
    export function create(
        text: string,
        bg: number = 0,
        fg: number = 1,
    ): TextSprite {
        const sprite = new TextSprite(text, bg, fg, 8, 0, 0, 0, 0, 0);
        game.currentScene().physicsEngine.addSprite(sprite);
        return sprite;
    }

    export function outlineOtherColor(img: Image, targetColor: number, outlineWidth: number, outlineColor: number) {
        let toOutlineX: number[] = [];
        let toOutlineY: number[] = [];
        for (let x = 0; x < img.width; x++) {
            for (let y = 0; y < img.height; y++) {
                for (let sx = 0; sx <= outlineWidth; sx++) {
                    for (let sy = 0; sy <= outlineWidth; sy++) {
                        if (sx + sy === 0)
                            continue;
                        if (img.getPixel(x, y) === targetColor)
                            continue
                        if (img.getPixel(x + sx, y + sy) === targetColor
                            || img.getPixel(x - sx, y + sy) === targetColor
                            || img.getPixel(x + sx, y - sy) === targetColor
                            || img.getPixel(x - sx, y - sy) === targetColor
                            ) {
                            img.setPixel(x, y, outlineColor)
                            // toOutlineX.push(x)
                            // toOutlineY.push(y)
                        }
                    }
                }
            }
        }
        // for (let i = 0; i < toOutlineX.length; i++) {
        //     const x = toOutlineX[i]
        //     const y = toOutlineY[i]
        //     img.setPixel(x, y, outlineColor)
        // }
    }
}