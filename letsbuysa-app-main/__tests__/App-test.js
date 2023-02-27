/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';

import {Label} from 'src/component';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';


jest.mock('react-navigation', () => {
    return {
        createAppContainer: jest.fn().mockReturnValue(function NavigationContainer(props) {
            return null;
        }),
        createDrawerNavigator: jest.fn(),
        createBottomTabNavigator: jest.fn(),
        createStackNavigator: jest.fn(),
        StackActions: {
            push: jest.fn().mockImplementation(x => ({...x, "type": "Navigation/PUSH"})),
            replace: jest.fn().mockImplementation(x => ({...x, "type": "Navigation/REPLACE"})),
        },
        NavigationActions: {
            navigate: jest.fn().mockImplementation(x => x),
        }
    }
});

jest.mock('redux-persist/integration/react', () => ({
    PersistGate: props => props.children,
}));

it('label renders correctly', () => {
    const tree = renderer.create(<Label/>).toJSON();
    expect(tree).toMatchSnapshot();
});
