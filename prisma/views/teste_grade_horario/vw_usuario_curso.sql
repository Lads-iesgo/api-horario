SELECT
  `u`.`idUsuario` AS `idUsuario`,
  `u`.`nomeUsuario` AS `nomeUsuario`,
  `c`.`idCurso` AS `idCurso`,
  `c`.`nomeCurso` AS `nomeCurso`
FROM
  (
    (
      (
        `teste_grade_horario`.`usuario` `u`
        JOIN `teste_grade_horario`.`professor` `p` ON((`u`.`idUsuario` = `p`.`idUsuario`))
      )
      JOIN `teste_grade_horario`.`professor_curso` `pc` ON((`p`.`idProfessor` = `pc`.`idProfessor`))
    )
    JOIN `teste_grade_horario`.`curso` `c` ON((`pc`.`idCurso` = `c`.`idCurso`))
  )