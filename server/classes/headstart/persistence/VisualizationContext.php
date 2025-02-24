<?php

namespace headstart\persistence;

class VisualizationContext
{
    public array $data;
    public int $httpcode;

    public function __construct(array $data, int $httpcode)
    //do we want more validation than just array?
    //e.g. checking that all things we rely on in getContext are there,
    //if not then throw something which can be caught by the calling function
    {
        $this->data = $data;
        $this->httpcode = $httpcode;
    }

}