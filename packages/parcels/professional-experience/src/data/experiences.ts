export type Experience = {
  company: string;
  roleKey: string;
  startDate: string;
  endDate: string | null;
  location: string;
  descriptionKey: string;
  skills: string[];
};

export const EXPERIENCES: readonly Experience[] = [
  {
    company: 'Qlik',
    roleKey: 'experience.qlik-principal.role',
    startDate: '2023-09',
    endDate: null,
    location: 'Nantes, France',
    descriptionKey: 'experience.qlik-principal.description',
    skills: [
      'TypeScript',
      'React',
      'JavaScript',
      'Github Actions',
      'Architecture Frontend',
      'Pnpm',
      'Vite',
      'Vitest',
      'Playwright',
    ],
  },
  {
    company: 'Talend',
    roleKey: 'experience.talend-principal.role',
    startDate: '2021-03',
    endDate: '2023-09',
    location: 'Nantes, France',
    descriptionKey: 'experience.talend-principal.description',
    skills: ['TypeScript', 'React', 'JavaScript', 'Architecture Frontend'],
  },
  {
    company: 'Talend',
    roleKey: 'experience.talend-senior.role',
    startDate: '2017-10',
    endDate: '2021-03',
    location: 'Nantes, France',
    descriptionKey: 'experience.talend-senior.description',
    skills: ['React', 'JavaScript', 'TypeScript', 'CSS'],
  },
  {
    company: 'Infotel',
    roleKey: 'experience.infotel.role',
    startDate: '2015-11',
    endDate: '2017-09',
    location: 'Nantes, France',
    descriptionKey: 'experience.infotel.description',
    skills: ['JavaScript', 'Angular', 'Ionic', 'HTML', 'CSS'],
  },
  {
    company: 'Steria Group',
    roleKey: 'experience.steria-tamaris.role',
    startDate: '2013-05',
    endDate: '2015-11',
    location: 'Saint-Herblain, France',
    descriptionKey: 'experience.steria-tamaris.description',
    skills: ['Java', 'SpringMVC', 'SpringBatch', 'Flex', 'AngularJS', 'Oracle', 'MySQL'],
  },
  {
    company: 'Steria Group',
    roleKey: 'experience.steria-pole-emploi.role',
    startDate: '2013-02',
    endDate: '2013-04',
    location: 'Saint-Herblain, France',
    descriptionKey: 'experience.steria-pole-emploi.description',
    skills: ['Java', 'Hibernate', 'HTML', 'JavaScript', 'Oracle'],
  },
  {
    company: 'Steria Group',
    roleKey: 'experience.steria-ministere.role',
    startDate: '2009-11',
    endDate: '2013-02',
    location: 'Saint-Herblain, France',
    descriptionKey: 'experience.steria-ministere.description',
    skills: ['Java', 'Hibernate', 'Struts', 'PHP', 'HTML', 'JavaScript', 'Oracle', 'MySQL'],
  },
  {
    company: "Im'Info",
    roleKey: 'experience.iminfo.role',
    startDate: '2007-06',
    endDate: '2009-09',
    location: 'Nantes, France',
    descriptionKey: 'experience.iminfo.description',
    skills: ['Java', 'EclipseRCP', 'HTML', 'JavaScript'],
  },
];
