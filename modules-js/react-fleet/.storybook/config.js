import { addParameters, configure } from '@storybook/react';

import { loadStories, storybookOptions } from '@cityofboston/storybook-common';

import './addons';

const req = require.context('../src', true, /\.stories\.(jsx?|tsx?)$/);

addParameters(storybookOptions('react-fleet'));

configure(() => loadStories(req), module);
