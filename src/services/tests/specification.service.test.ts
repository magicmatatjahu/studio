import { createServices } from '../';

import type { SpecificationService } from '../specification.service';

describe('SpecificationService', () => {
  let specificationSvc: SpecificationService;

  beforeAll(async () => {
    const services = await createServices();
    specificationSvc = services.specificationSvc;
  });

  describe('.shouldInformAboutLatestVersion', () => {
    test('should inform - case with non latest version, 2.1.0', () => {
      sessionStorage.removeItem('informed-about-latest');
      const result = specificationSvc.shouldInformAboutLatestVersion('2.1.0');
      expect(result).toEqual(true);
    });

    test('should not inform - case when `informed-about-latest` is set in session storage', () => {
      sessionStorage.setItem('informed-about-latest', (new Date()).toString());
      const result = specificationSvc.shouldInformAboutLatestVersion('2.1.0');
      // false, because `informed-about-latest` is set to current date
      expect(result).toEqual(false);
    });

    test('should not inform - case when `informed-about-latest` was set the day before', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      sessionStorage.setItem('informed-about-latest', twoDaysAgo.toString());

      const result = specificationSvc.shouldInformAboutLatestVersion('2.1.0');
      // true, because `informed-about-latest` is set two days earlier
      expect(result).toEqual(true);
    });
  });
});