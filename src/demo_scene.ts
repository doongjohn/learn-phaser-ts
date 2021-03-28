export default class DemoScene extends Phaser.Scene
{
    constructor ()
    {
        super('demo');
    }

    preload ()
    {

    }

    create ()
    {
        // white rectangle at center
        var r1 = this.add.rectangle(0, 0, 148, 148, 0xffffff);
    }
}