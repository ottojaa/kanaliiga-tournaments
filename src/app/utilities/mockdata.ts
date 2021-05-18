import { Participants } from '../interfaces/participants';
import { Tournament } from '../interfaces/tournament';

export class MockData {
  public static getTournaments(): Tournament[] {
    return [
      {
        id: '378426939508809728',
        discipline: 'my_discipline',
        name: 'My Weekly Tournament',
        full_name: 'My Weekly Tournament - Long title',
        status: 'running',
        scheduled_date_start: '2015-09-06',
        scheduled_date_end: '2015-09-07',
        timezone: 'America/Sao_Paulo',
        public: true,
        size: 16,
        online: true,
        location: 'London',
        country: 'GB',
        platforms: ['pc', 'playstation4'],
        logo: {
          logo_small: 'https://www.toornament.com/media/file/123456/logo_small',
          logo_medium:
            'https://www.toornament.com/media/file/123456/logo_medium',
          logo_large: 'https://www.toornament.com/media/file/123456/logo_large',
          original: 'https://www.toornament.com/media/file/123456/original',
        },
        registration_enabled: true,
        registration_opening_datetime: '1999-01-01T00:00:00+00:00',
        registration_closing_datetime: '1999-01-01T00:00:00+00:00',
      },
      {
        id: '378426939508809728',
        discipline: 'my_discipline',
        name: 'Kanaliiga V2 Tournament',
        full_name: 'My Weekly Tournament - Long title',
        status: 'running',
        scheduled_date_start: '2015-09-06',
        scheduled_date_end: '2015-09-07',
        timezone: 'America/Sao_Paulo',
        public: true,
        size: 16,
        online: true,
        location: 'London',
        country: 'GB',
        platforms: ['pc', 'playstation4'],
        logo: {
          logo_small: 'https://www.toornament.com/media/file/123456/logo_small',
          logo_medium:
            'https://www.toornament.com/media/file/123456/logo_medium',
          logo_large: 'https://www.toornament.com/media/file/123456/logo_large',
          original: 'https://www.toornament.com/media/file/123456/original',
        },
        registration_enabled: true,
        registration_opening_datetime: '1999-01-01T00:00:00+00:00',
        registration_closing_datetime: '1999-01-01T00:00:00+00:00',
      },

      {
        id: '378426939508809728',
        discipline: 'my_discipline',
        name: 'My Weekly Tournament',
        full_name: 'My Weekly Tournament - Long title',
        status: 'running',
        scheduled_date_start: '2015-09-06',
        scheduled_date_end: '2015-09-07',
        timezone: 'America/Sao_Paulo',
        public: true,
        size: 16,
        online: true,
        location: 'London',
        country: 'GB',
        platforms: ['pc', 'playstation4'],
        logo: {
          logo_small: 'https://www.toornament.com/media/file/123456/logo_small',
          logo_medium:
            'https://www.toornament.com/media/file/123456/logo_medium',
          logo_large: 'https://www.toornament.com/media/file/123456/logo_large',
          original: 'https://www.toornament.com/media/file/123456/original',
        },
        registration_enabled: true,
        registration_opening_datetime: '1999-01-01T00:00:00+00:00',
        registration_closing_datetime: '1999-01-01T00:00:00+00:00',
      },
      {
        id: '378426939508809728',
        discipline: 'my_discipline',
        name: 'Kanaliiga V2 Tournament',
        full_name: 'My Weekly Tournament - Long title',
        status: 'running',
        scheduled_date_start: '2015-09-06',
        scheduled_date_end: '2015-09-07',
        timezone: 'America/Sao_Paulo',
        public: true,
        size: 16,
        online: true,
        location: 'London',
        country: 'GB',
        platforms: ['pc', 'playstation4'],
        logo: {
          logo_small: 'https://www.toornament.com/media/file/123456/logo_small',
          logo_medium:
            'https://www.toornament.com/media/file/123456/logo_medium',
          logo_large: 'https://www.toornament.com/media/file/123456/logo_large',
          original: 'https://www.toornament.com/media/file/123456/original',
        },
        registration_enabled: true,
        registration_opening_datetime: '1999-01-01T00:00:00+00:00',
        registration_closing_datetime: '1999-01-01T00:00:00+00:00',
      },
    ];
  }

  public static getMatchData(): any {
    return [
      {
        id: '618954615761465416',
        number: 1,
        type: 'duel',
        status: 'pending',
        scheduled_datetime: '2015-12-31T00:00:00+00:00',
        played_at: '2015-12-31T00:00:00+00:00',
        opponents: [
          {
            name: 'Valtori',
            result: 'lose',
            forfeit: false,
            score: 4,
            scoreOpponent: '',
            participants: [
              {
                id: '375143143408309123',
                name: 'Tupravaara',
              },
              {
                id: '3715252525435436666',
                name: 'Rento',
              },
              {
                name: 'IRWIN GOODMAN',
              },
            ],
          },
          {
            name: 'CGI Helsinki',
            number: 1,
            position: 1,
            result: 'win',
            forfeit: false,
            score: 15,
            scoreOpponent: '',
            participants: [
              {
                id: '375143143408309123',
                name: 'TECHNODICTATOR',
              },
              {
                id: '3715252525435436666',
                name: 'Wacky',
              },
              {
                name: 'deepfake22',
              },
            ],
          },
        ],
      },
      {
        id: '618954615761465416',
        number: 2,
        type: 'duel',
        status: 'pending',
        scheduled_datetime: '2015-12-31T00:00:00+00:00',
        played_at: '2015-12-31T00:00:00+00:00',
        opponents: [
          {
            name: 'Valtori',
            result: 'lose',
            forfeit: false,
            score: 4,
            scoreOpponent: '',
            participants: [
              {
                id: '375143143408309123',
                name: 'Valtoriboi #1',
              },
              {
                id: '3715252525435436666',
                name: 'Valtoriboi #2',
              },
              {
                name: 'Valtoriboi #3',
              },
            ],
          },
          {
            name: 'CGI Helsinki',
            number: 1,
            position: 1,
            result: 'win',
            forfeit: false,
            score: 15,
            scoreOpponent: '',
            participants: [
              {
                id: '375143143408309123',
                name: 'TECHNODICTATOR',
              },
              {
                id: '3715252525435436666',
                name: 'Wacky',
              },
              {
                name: 'deepfake22',
              },
            ],
          },
        ],
      },
    ];
  }

  public static getParticipants(): any[] {
    return [
      {
        id: '375143143408309123',
        name: 'Highlanders',
        lineUp: [
          { name: 'Rentovaara' },
          { name: 'Tupra' },
          { name: 'Kalukassi' },
        ],
      },
      {
        id: '5353535211214389',
        name: 'Savu & Pönttö',
        lineUp: [
          { name: 'TECHNODICTATOR' },
          { name: 'Wacky' },
          { name: 'deepfake22' },
        ],
      },
    ];
  }
}
