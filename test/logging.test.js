import { describe, expect, test } from '@jest/globals';

import {
  Handler,
  JsonFormatter,
  Level,
  LogRecord,
  Logger,
  SimpleFormatter,
} from '../lib/logging.js';

describe('Logging', () => {
  describe('Level', () => {
    test('Converts to string', () => {
      const result = Level.INFO.toString();

      expect(result).toEqual('INFO');
    });

    test('Converts to value', () => {
      const result = Level.INFO.valueOf();

      expect(result).toEqual(800);
    });

    test('Converts to JSON ', () => {
      const result = Level.INFO.toJSON();

      expect(result).toEqual('INFO');
    });

    test('Parses level by name', () => {
      const level = Level.parse('WARNING');

      expect(level).toEqual(Level.WARNING);
    });

    test('Parses level by value', () => {
      const level = Level.parse('1000');

      expect(level).toEqual(Level.ERROR);
    });

    test('Parses level by name', () => {
      expect(() => Level.parse('NON_EXISTING')).toThrow();
    });
  });

  describe('Handler', () => {
    test('Handles all levels as default', () => {
      const handler = new Handler();

      expect(handler.isLoggable(Level.ALL)).toEqual(true);
    });

    test('Does not handle below level', () => {
      const handler = new Handler();
      handler.level = Level.WARNING;

      expect(handler.isLoggable(Level.INFO)).toEqual(false);
    });
  });

  describe('Logger', () => {
    test('Creates named logger', () => {
      const log = Logger.getLogger('test-logger');
      const loggedMessages = log.trackMessagesLogged();

      log.info('my message');

      expect(log.name).toEqual('test-logger');
      expect(loggedMessages.data).toEqual([
        {
          date: expect.any(Date),
          millis: expect.any(Number),
          sequenceNumber: expect.any(Number),
          loggerName: 'test-logger',
          level: Level.INFO,
          message: ['my message'],
        },
      ]);
    });

    test('Logs with level and message', () => {
      const log = Logger.getLogger('test-logger');
      const loggedMessages = log.trackMessagesLogged();

      log.log(Level.INFO, 'my message');

      expect(loggedMessages.data).toEqual([
        {
          date: expect.any(Date),
          millis: expect.any(Number),
          sequenceNumber: expect.any(Number),
          loggerName: 'test-logger',
          level: Level.INFO,
          message: ['my message'],
        },
      ]);
    });

    test('Logs at level error', () => {
      const log = Logger.getLogger('test-logger');
      const loggedMessages = log.trackMessagesLogged();

      log.error('error message');

      expect(loggedMessages.data).toEqual([
        {
          date: expect.any(Date),
          millis: expect.any(Number),
          sequenceNumber: expect.any(Number),
          loggerName: 'test-logger',
          level: Level.ERROR,
          message: ['error message'],
        },
      ]);
    });

    test('Logs at level warning', () => {
      const log = Logger.getLogger('test-logger');
      const loggedMessages = log.trackMessagesLogged();

      log.warning('warning message');

      expect(loggedMessages.data).toEqual([
        {
          date: expect.any(Date),
          millis: expect.any(Number),
          sequenceNumber: expect.any(Number),
          loggerName: 'test-logger',
          level: Level.WARNING,
          message: ['warning message'],
        },
      ]);
    });

    test('Logs at level info', () => {
      const log = Logger.getLogger('test-logger');
      const loggedMessages = log.trackMessagesLogged();

      log.info('info message');

      expect(loggedMessages.data).toEqual([
        {
          date: expect.any(Date),
          millis: expect.any(Number),
          sequenceNumber: expect.any(Number),
          loggerName: 'test-logger',
          level: Level.INFO,
          message: ['info message'],
        },
      ]);
    });

    test('Logs at level debug', () => {
      const log = Logger.getLogger('test-logger');
      log.level = Level.ALL;
      const loggedMessages = log.trackMessagesLogged();

      log.debug('debug message');

      expect(loggedMessages.data).toEqual([
        {
          date: expect.any(Date),
          millis: expect.any(Number),
          sequenceNumber: expect.any(Number),
          loggerName: 'test-logger',
          level: Level.DEBUG,
          message: ['debug message'],
        },
      ]);
    });

    test('Logs at level trace', () => {
      const log = Logger.getLogger('test-logger');
      log.level = Level.ALL;
      const loggedMessages = log.trackMessagesLogged();

      log.trace('trace message');

      expect(loggedMessages.data).toEqual([
        {
          date: expect.any(Date),
          millis: expect.any(Number),
          sequenceNumber: expect.any(Number),
          loggerName: 'test-logger',
          level: Level.TRACE,
          message: ['trace message'],
        },
      ]);
    });

    test('Logs at info level by default', () => {
      const log = Logger.getLogger('test-logger-default');
      const loggedMessages = log.trackMessagesLogged();

      log.error('error message');
      log.warning('warning message');
      log.info('info message');
      log.debug('debug message');
      log.trace('trace message');

      expect(loggedMessages.data).toEqual([
        {
          date: expect.any(Date),
          millis: expect.any(Number),
          sequenceNumber: expect.any(Number),
          loggerName: 'test-logger-default',
          level: Level.ERROR,
          message: expect.anything(),
        },
        {
          date: expect.any(Date),
          millis: expect.any(Number),
          sequenceNumber: expect.any(Number),
          loggerName: 'test-logger-default',
          level: Level.WARNING,
          message: expect.anything(),
        },
        {
          date: expect.any(Date),
          millis: expect.any(Number),
          sequenceNumber: expect.any(Number),
          loggerName: 'test-logger-default',
          level: Level.INFO,
          message: expect.anything(),
        },
      ]);
    });

    test('Does not log below level', () => {
      const log = Logger.getLogger('test-logger');
      log.level = Level.WARNING;
      const loggedMessages = log.trackMessagesLogged();

      log.info('info message');

      expect(loggedMessages.data).toEqual([]);
    });

    test('Logs with local level if set', () => {
      const log = Logger.getLogger('test-logger');
      log.level = Level.DEBUG;
      const loggedMessages = log.trackMessagesLogged();

      log.debug('debug message');

      expect(loggedMessages.data).toEqual([
        {
          date: expect.any(Date),
          millis: expect.any(Number),
          sequenceNumber: expect.any(Number),
          loggerName: 'test-logger',
          level: Level.DEBUG,
          message: ['debug message'],
        },
      ]);
    });

    test('Logs with parent level if local level is not set', () => {
      Logger.getLogger('').level = Level.DEBUG;
      const log = Logger.getLogger('test-logger');
      log.level = undefined;
      const loggedMessages = log.trackMessagesLogged();

      log.debug('debug message');

      expect(loggedMessages.data).toEqual([
        {
          date: expect.any(Date),
          millis: expect.any(Number),
          sequenceNumber: expect.any(Number),
          loggerName: 'test-logger',
          level: Level.DEBUG,
          message: ['debug message'],
        },
      ]);
    });
  });

  describe('Simple formatter', () => {
    test('Returns 1 line', () => {
      const formatter = new SimpleFormatter();

      const record = new LogRecord(Level.INFO, 'my message');
      record.date = new Date('2024-07-02T11:38:00');
      const s = formatter.format(record);

      expect(s).toEqual('2024-07-02T09:38:00.000Z INFO - my message');
    });

    test('Writes logger name', () => {
      const formatter = new SimpleFormatter();

      const record = new LogRecord(Level.INFO, 'my message');
      record.loggerName = 'test-logger';
      record.date = new Date('2024-07-02T11:38:00');
      const s = formatter.format(record);

      expect(s).toEqual(
        '2024-07-02T09:38:00.000Z [test-logger] INFO - my message',
      );
    });

    test('Concats messages with space', () => {
      const formatter = new SimpleFormatter();

      const record = new LogRecord(Level.INFO, 'count:', 5);
      record.date = new Date('2024-07-02T11:38:00');
      const s = formatter.format(record);

      expect(s).toEqual('2024-07-02T09:38:00.000Z INFO - count: 5');
    });

    test('Stringifies object and array', () => {
      const formatter = new SimpleFormatter();

      const record = new LogRecord(Level.INFO, { foo: 'bar' }, [1, 2, 3]);
      record.date = new Date('2024-07-02T11:38:00');
      const s = formatter.format(record);

      expect(s).toEqual(
        '2024-07-02T09:38:00.000Z INFO - {"foo":"bar"} [1,2,3]',
      );
    });
  });

  describe('JSON formatter', () => {
    test('Returns 1 line', () => {
      const formatter = new JsonFormatter();

      const record = new LogRecord(Level.INFO, 'my message');
      record.date = new Date('2024-07-02T11:38:00');
      const s = formatter.format(record);

      const json = JSON.parse(s);
      expect(json).toEqual({
        date: '2024-07-02T09:38:00.000Z',
        millis: 1719913080000,
        sequence: expect.any(Number),
        level: 'INFO',
        message: 'my message',
      });
    });

    test('Writes logger name', () => {
      const formatter = new JsonFormatter();

      const record = new LogRecord(Level.INFO, 'my message');
      record.loggerName = 'test-logger';
      record.date = new Date('2024-07-02T11:38:00');
      const s = formatter.format(record);

      const json = JSON.parse(s);
      expect(json).toEqual({
        date: '2024-07-02T09:38:00.000Z',
        millis: 1719913080000,
        sequence: expect.any(Number),
        logger: 'test-logger',
        level: 'INFO',
        message: 'my message',
      });
    });

    test('Concats messages with space', () => {
      const formatter = new JsonFormatter();

      const record = new LogRecord(Level.INFO, 'count:', 5);
      record.date = new Date('2024-07-02T11:38:00');
      const s = formatter.format(record);

      const json = JSON.parse(s);
      expect(json).toEqual({
        date: '2024-07-02T09:38:00.000Z',
        millis: 1719913080000,
        sequence: expect.any(Number),
        level: 'INFO',
        message: 'count: 5',
      });
    });

    test('Stringifies object and array', () => {
      const formatter = new JsonFormatter();

      const record = new LogRecord(Level.INFO, { foo: 'bar' }, [1, 2, 3]);
      record.date = new Date('2024-07-02T11:38:00');
      const s = formatter.format(record);

      const json = JSON.parse(s);
      expect(json).toEqual({
        date: '2024-07-02T09:38:00.000Z',
        millis: 1719913080000,
        sequence: expect.any(Number),
        level: 'INFO',
        message: '{"foo":"bar"} [1,2,3]',
      });
    });
  });
});
