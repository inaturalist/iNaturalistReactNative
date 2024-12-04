# frozen_string_literal: true

require "nokogiri"

num_cleaned = 0
[ARGV].flatten.each do | path |
  unless path.end_with?( ".svg" )
    raise "#{path} is not a .svg file"
  end

  svg = File.read( path )
  doc = Nokogiri::XML( svg, &:noblanks )
  if doc.at( "svg" )["width"].to_i != 24 || doc.at( "svg" )["height"].to_i != 24
    raise "#{path} is not a 24x24 square"
  end

  doc.search( "//path" ).each do | path_node |
    if path_node["fill-rule"] == "evenodd" || path_node["style"] =~ /fill-rule:\s+?evenodd/
      raise "#{path} has a path with evenodd. They should all have nonzero fill."
    end
  end
  doc.at( "defs" )&.remove
  if doc.namespaces.include?( "xmlns:sodipodi" )
    doc.search( "//sodipodi:namedview" ).each( &:remove )
  end
  doc.traverse do | node |
    next unless node.respond_to? :attributes

    node.attributes.each do | key, val |
      next unless
        val&.namespace&.prefix == "sodipodi" ||
          val&.namespace&.prefix == "inkscape" ||
          %w(id style fill).include?( key )

      val.remove
    end
  end
  # doc.at("svg").remove_attribute "xmlns:inkscape"
  # doc.at("svg").remove_attribute "xmlns:sodipodi"
  doc.remove_namespaces!
  File.write( path, doc.to_xml( indent: 2 ) )
  num_cleaned += 1
end
puts "Cleaned #{num_cleaned} SVGs"
