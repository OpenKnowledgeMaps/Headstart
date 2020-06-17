
Integration layer needs to be able to move independently of both the react and mediator levels without erroring.

It needs to wire up:
- Old style jquery events to react state
- Changes of react state to call jquery events

The integration layer should *only* be set to listen to mediator events.
Otherwise the integration layer will potentially get the same amount of complexity as the rest of the application

Similarly the integration layer should only fire mediator events. This might require making additional mediator events
(or refactoring the existing ones to split up functionality).

At the moment it seems we should only have the integration layer listen to the:
- draw_title
- bubble_zoomin
