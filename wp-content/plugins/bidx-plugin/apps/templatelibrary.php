<?php
/**
 * Rendering of variables into template
 * It renders the variables assigned them through load method through main app.php file
 *
 *
 *
 * @author Altaf Samnani
 * @version 1.0
 */
class TemplateLibrary {
    protected $template_dir = 'templates/';
    protected $vars = array();

   /**
	 * Constructor.
	 * Assign the templates directory
	 */
    public function __construct($template_dir = null) {
        if ($template_dir !== null) {
            // Check here whether this directory really exists
            $this->template_dir = $template_dir;
        }
    }

   /**
	 * Renders the file to display content
	 * @param string $template_file file to display
	 *
	 */
    public function render($template_file) {
        if (file_exists($this->template_dir.$template_file)) {
            include $this->template_dir.$template_file;
        } else {
            throw new Exception('no template file ' . $template_file . ' present in directory ' . $this->template_dir);
        }
    }

   /**
	 * PHP Magicmethod to assign variables
	 * @param string $name name of the variable
   * @param string $value value of the variable
	 *
	 */
    public function __set($name, $value) {
        $this->vars[$name] = $value;
    }

    /**
	 * PHP Magicmethods to get variables value
	 * @param string $name name of the variable
	 *
	 */
    public function __get($name) {
        return $this->vars[$name];
    }
}
?>