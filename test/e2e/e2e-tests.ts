import Stryker from '../../src/Stryker';
import * as ReporterFactory from '../../src/ReporterFactory';
import BaseReporter from '../../src/reporters/BaseReporter';
import * as sinon from 'sinon';
import Mutant, {MutantStatus} from '../../src/Mutant';
import {expect} from 'chai';

function files(...files: string[]) {
  return files.map(file => `${__dirname}/../../../test/e2e/${file}`);
}

class E2EReporter extends BaseReporter {
  mutants: Mutant[];
  allMutantsTested(mutants: Mutant[]) {
    this.mutants = mutants;
  }
}

describe('e2e', () => {
  let sut: Stryker;
  let sandbox: sinon.SinonSandbox;
  let reporter: E2EReporter;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    let reporterFactoryStub = <any>sandbox.stub();
    (<any>ReporterFactory).default = () => reporterFactoryStub;
    reporter = new E2EReporter();
    reporterFactoryStub.getReporter = sandbox.stub().returns(reporter);
  });

  describe('when mutation will result in endless loop', () => {
    beforeEach(() => {
      sut = new Stryker({ files: files('src/endlessLoop.js', 'tests/endlessLoopSpec.js'), mutate: files('src/endlessLoop.js'), reporters: ['e2e-reporter'] });
      return sut.runMutationTest();
    });

    it('should kill phantom js after timeout', () => {
      expect(reporter.mutants).to.have.length(5);
      expect(reporter.mutants.filter(m => m.status === MutantStatus.SURVIVED).length).to.eq(3);
      expect(reporter.mutants.filter(m => m.status === MutantStatus.TIMEDOUT).length).to.eq(2);
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

});