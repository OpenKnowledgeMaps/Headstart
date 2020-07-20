import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { configure, shallow } from 'enzyme';
import ExampleModernComponent from '../js/components/ExampleModernComponent';

configure({adapter: new Adapter()});
it('renders without crashing', () => {
  shallow(<ExampleModernComponent />);
});
