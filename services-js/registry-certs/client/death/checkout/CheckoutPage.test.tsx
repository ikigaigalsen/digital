import Router from 'next/router';

import CheckoutPage, { PageDependenciesProps } from './CheckoutPage';
import CheckoutDao from '../../dao/CheckoutDao';
import OrderProvider from '../../store/OrderProvider';
import Accessibility from '../../store/Accessibility';
import SiteAnalytics from '../../lib/SiteAnalytics';
import Cart from '../../store/Cart';

jest.mock('next/router');
jest.mock('../../dao/CheckoutDao');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getInitialProps', () => {
  let res: any;

  beforeEach(() => {
    res = {
      writeHead: jest.fn(),
      end: jest.fn(),
    };
  });

  it('treats no page query param as shipping', async () => {
    const initialProps = await CheckoutPage.getInitialProps(
      { res, query: {} },
      {}
    );
    expect(initialProps.info.page).toEqual('shipping');
  });

  it('process payment on server', async () => {
    const initialProps = await CheckoutPage.getInitialProps(
      { res, query: { page: 'payment' } },
      {}
    );

    expect(initialProps.info.page).toEqual('payment');
  });

  it('redirects payment on server back to shipping', async () => {
    await CheckoutPage.getInitialProps({ res, query: { page: 'payment' } }, {});

    expect(res.writeHead).toHaveBeenCalled();
  });

  it('redirects unknown page query param to shipping on server', async () => {
    await CheckoutPage.getInitialProps(
      {
        res,
        query: { page: 'not-a-real-page' },
      },
      {}
    );

    expect(res.writeHead).toHaveBeenCalled();
  });

  it('treats unknown page query param as shipping on client', async () => {
    const initialProps = await CheckoutPage.getInitialProps(
      {
        res: undefined,
        query: { page: 'not-a-real-page' },
      },
      {}
    );

    expect(initialProps.info.page).toEqual('shipping');
  });

  it('passes confirm props along', async () => {
    const initialProps = await CheckoutPage.getInitialProps(
      {
        res: undefined,
        query: {
          page: 'confirmation',
          orderId: '123-456-7',
          contactEmail: 'ttoe@squirrelzone.net',
        },
      },
      {}
    );

    expect(initialProps.info).toEqual({
      page: 'confirmation',
      orderId: '123-456-7',
      contactEmail: 'ttoe@squirrelzone.net',
    });
  });
});

describe('rendering', () => {
  let pageDependenciesProps: PageDependenciesProps;

  beforeEach(() => {
    pageDependenciesProps = {
      accessibility: new Accessibility(),
      cart: new Cart(),
      checkoutDao: {} as any,
      orderProvider: new OrderProvider(),
      siteAnalytics: new SiteAnalytics(),
      stripe: null,
    };
  });

  it('renders shipping', () => {
    expect(
      new CheckoutPage({
        info: { page: 'shipping' },
        ...pageDependenciesProps,
      }).render()
    ).toMatchSnapshot();
  });

  it('renders payment', () => {
    expect(
      new CheckoutPage({
        info: { page: 'payment' },
        ...pageDependenciesProps,
      }).render()
    ).toMatchSnapshot();
  });

  it('renders review', () => {
    expect(
      new CheckoutPage({
        info: { page: 'review' },
        ...pageDependenciesProps,
      }).render()
    ).toMatchSnapshot();
  });

  it('renders confirmation', () => {
    expect(
      new CheckoutPage({
        info: {
          page: 'confirmation',
          orderId: '123-456-7',
          contactEmail: 'ttoe@squirrelzone.net',
        },
        ...pageDependenciesProps,
      }).render()
    ).toMatchSnapshot();
  });
});

describe('operations', () => {
  let checkoutDao: CheckoutDao;
  let orderProvider: OrderProvider;
  let component;
  let scrollSpy;

  beforeEach(() => {
    scrollSpy = jest.spyOn(window, 'scroll').mockImplementation(() => {});

    orderProvider = new OrderProvider();
    checkoutDao = new CheckoutDao(null as any, null);

    // page doesn't really matter for this
    component = new CheckoutPage({
      accessibility: new Accessibility(),
      cart: new Cart(),
      siteAnalytics: new SiteAnalytics(),
      stripe: null,

      info: { page: 'shipping' },
      orderProvider,
      checkoutDao,
    });

    component.componentWillMount();
  });

  afterEach(() => {
    scrollSpy.mockRestore();
  });

  describe('advanceToPayment', () => {
    it('routes to next stage', () => {
      component.advanceToPayment();
      expect(Router.push).toHaveBeenCalled();
    });
  });

  describe('advanceToReview', () => {
    it('routes to next stage if tokenization is successful', async () => {
      (checkoutDao.tokenizeCard as jest.Mock).mockReturnValue(
        Promise.resolve(true)
      );

      await component.advanceToReview(null);
      expect(Router.push).toHaveBeenCalled();
    });

    it('does not route if tokenization is unsuccessful', async () => {
      (checkoutDao.tokenizeCard as jest.Mock).mockReturnValue(
        Promise.resolve(false)
      );

      await component.advanceToReview(null);
      expect(Router.push).not.toHaveBeenCalled();
    });
  });

  describe('submitOrder', () => {
    it('redirects on success', async () => {
      (checkoutDao.submit as jest.Mock).mockReturnValue(
        Promise.resolve('test-order-id')
      );
      await component.submitOrder();
      expect(Router.push).toHaveBeenCalled();
    });

    it('stays on the same page on failure', async () => {
      (checkoutDao.submit as jest.Mock).mockReturnValue(Promise.resolve(null));
      await component.submitOrder();
      expect(Router.push).not.toHaveBeenCalled();
    });
  });
});
