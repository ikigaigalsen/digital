import React from 'react';

import { storiesOf } from '@storybook/react';

import MemorableDateInput from './MemorableDateInput';

storiesOf('Form Elements/Memorable date input', module)
  .add('default', () => (
    <MemorableDateInput
      componentId="default"
      handleDate={() => {}}
      legend={<h2>Date</h2>}
    />
  ))
  .add('earliestDate: 9/7/1630', () => (
    <MemorableDateInput
      componentId="earliest"
      earliestDate="9/7/1630"
      handleDate={() => {}}
      legend={<h2>Date</h2>}
    />
  ))
  .add('latestDate: 12/31/2025', () => (
    <MemorableDateInput
      componentId="latest"
      latestDate="12/31/2025"
      handleDate={() => {}}
      legend={<h2>Date</h2>}
    />
  ))
  .add('with an initialDate', () => (
    <MemorableDateInput
      componentId="initial"
      initialDate="12/31/1999"
      onlyAllowPast={true}
      handleDate={() => {}}
      legend={<h2>Date</h2>}
    />
  ))
  .add('onlyAllowPast', () => (
    <MemorableDateInput
      componentId="past"
      onlyAllowPast={true}
      handleDate={() => {}}
      legend={<h2>Date</h2>}
    />
  ))
  .add('onlyAllowFuture', () => (
    <MemorableDateInput
      componentId="future"
      onlyAllowFuture={true}
      handleDate={() => {}}
      legend={<h2>Date</h2>}
    />
  ))
  .add('onlyAllowFuture and latestDate: 1/1/2040', () => (
    <MemorableDateInput
      componentId="story"
      latestDate="1/1/2040"
      onlyAllowFuture={true}
      handleDate={() => {}}
      legend={<h2>Date</h2>}
    />
  ));