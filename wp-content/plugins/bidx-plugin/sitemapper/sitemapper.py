import yaml

from argparse import ArgumentParser
from db import DB


class SiteMapper:

    def __init__(self, config_file='sitemapper.yml'):
        self.config = None
        self.sitemaps = {}
        self.load_conf(filename=config_file)
        self.load_data()
        self.write_data()
        
    def load_conf(self, filename):
        with open(filename, 'r') as fd:
            self.config = yaml.load(fd)
        fd.close()

    def load_data(self):
        self.db = DB(config=self.config['database'])
        self.db.execute(self.config['sql'])
        #print 'Fields:'
        #print DB.field_names(self.db.cursor)
        #print 'Values:'
        #print self.db.cursor.fetchall()
        for groupdomain, url in self.db.cursor.fetchall():
            if not self.sitemaps.get(groupdomain, False):
                self.sitemaps[groupdomain] = {
                    'filename': '{0}{1}.txt'.format(
                        self.config['path'],
                        groupdomain
                    ),
                    'urls': []
                }
            self.sitemaps[groupdomain]['urls'].append(url)
        #print self.sitemaps

    def write_data(self):
        for groupdomain in self.sitemaps:
            with open(self.sitemaps[groupdomain]['filename'], 'w') as fd:
                for url in self.sitemaps[groupdomain]['urls']:
                    fd.write('{0}\n'.format(url))
            fd.close()


def main():

    parser = ArgumentParser(description='BidX Site Mapper')
    parser.add_argument(
        '-c', '--config_file', 
        nargs='?', default='sitemapper.yml', const='sitemapper.yml', 
        metavar='sitemapper.yml',
        help='Specify configuration file'
    )
    args = parser.parse_args()

    sm = SiteMapper(config_file=args.config_file)

if __name__ == '__main__':
    main()