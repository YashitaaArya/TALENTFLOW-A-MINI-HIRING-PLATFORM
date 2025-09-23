import { Factory } from 'miragejs';

export const jobFactory = Factory.extend({
  title(i) {
    return `Job Title ${i + 1}`;
  },
  status() {
    return ['active', 'archived'][Math.floor(Math.random() * 2)];
  },
});

export const candidateFactory = Factory.extend({
  name(i) {
    return `Candidate ${i + 1}`;
  },
  email(i) {
    return `candidate${i + 1}@example.com`;
  },
});
