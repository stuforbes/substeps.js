'use strict';

module.exports = function TagManager(_){

  return {
    create: function(tagString){
      var createTags = function(tagStr){
        var tagMap = _.groupBy(tagStr.split(/[ ,\n]+/), function(tag, i) {
          return _.str.startsWith(tag, '--') ? 'exclude' : 'include';
        });

        var includes = tagMap['include'] ? _.filter(tagMap['include'], function(item){ return item.length > 0; }) : [];
        var excludes = tagMap['exclude'] ? _.filter(_.map(tagMap['exclude'], function(tag){
          return tag.substring(2);
        }), function(item){ return item.length > 0; }) : [];

        return {includeTags: includes, excludeTags: excludes};
      };

      var areIncludesPresent = function(){
        return tags.includeTags.length > 0;
      };

      var tags = createTags(tagString ? tagString : '');

      return {
        isApplicable: function(tagList){
          var includesPresent = areIncludesPresent();

          var includeIntersection = _.intersection(tagList, tags.includeTags);
          var excludeIntersection = _.intersection(tagList, tags.excludeTags);

          return (includeIntersection.length > 0 || !areIncludesPresent()) && excludeIntersection.length === 0;
        }
      };
    }
  };
};
